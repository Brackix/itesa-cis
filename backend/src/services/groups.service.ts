import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { AppError } from "../utils/appError.util"

type StudentInput = {
    id: string;
    isCoordinator: boolean;
};

export class groupsService {
    static async findAll() {
        return prisma.groups.findMany();
    }

    static async findById(id: string) {
        return prisma.groups.findUnique({ where: { id } });
    }

    static async create(name: string) {
        return prisma.groups.create({ data: { id: CryptoUtil.generateUUID(), group_name: name } })
    }

    static async update(id: string, newName: string) {
        return prisma.groups.update({ where: { id }, data: { group_name: newName } })
    }

    static async delete(id: string) {
        return prisma.groups.delete({ where: { id } })
    }


    static async findStudentsInGroups() {
        const groups = await prisma.groups.findMany({
            include: {
                groups_students: {
                    orderBy: {
                        students: {
                            list_number: 'asc'
                        }
                    },
                    include: {
                        students: true,
                    }
                },
            }
        });

        return groups.map(group => ({
            id: group.id,
            name: group.group_name,
            isFull: group.group_full,
            students: group.groups_students.map(gs => ({
                id: gs.students.id,
                list_number: gs.students.list_number,
                name: gs.students.name,
                last_name: gs.students.last_name,
                section: gs.students.section,
                image_url: gs.students.image_url,
                alt_text: gs.students.alt_text,
                is_coordinator: gs.is_coordinator,
            }))
        }));
    }


    static async getStudentsFromGroup(groupId: string) {
        const group = await prisma.groups.findUnique({ where: { id: groupId } });

        if (!group) throw new AppError('GROUP_NOT_FOUND', 404);

        const students = await prisma.groups_students.findMany({
            where: { group_id: groupId },
            orderBy: {
                students: {
                    list_number: 'asc'
                }
            }
        });

        return students;
    }

    //Group students
    static async addStudentsToGroup(groupId: string, students: StudentInput[], replaceCoordinator: boolean) {

        // 1. Validar grupo
        const group = await prisma.groups.findUnique({
            where: { id: groupId }
        });

        if (!group) {
            throw new AppError('GROUP_NOT_FOUND', 404);
        }

        const studentIds = students.map(s => s.id);

        // 2. Validar duplicados en request
        const uniqueIds = new Set(studentIds);
        if (uniqueIds.size !== studentIds.length) {
            throw new AppError('DUPLICATED_STUDENTS_IN_REQUEST', 400);
        }

        // 3. Validar existencia de estudiantes en la base de datos
        const existingStudents = await prisma.students.findMany({
            where: { id: { in: studentIds } },
            select: { id: true }
        });

        if (existingStudents.length !== studentIds.length) {
            const existingIds = existingStudents.map(s => s.id);
            const missingIds = studentIds.filter(id => !existingIds.includes(id));
            throw new AppError(`STUDENTS_NOT_FOUND: ${missingIds.join(', ')}`, 404);
        }

        // 4. Validar que los estudiantes no estén ya asignados a NINGÚN grupo
        const alreadyAssigned = await prisma.groups_students.findMany({
            where: { student_id: { in: studentIds } },
            select: { student_id: true }
        });

        if (alreadyAssigned.length > 0) {
            const assignedIds = alreadyAssigned.map(a => a.student_id);
            throw new AppError(`STUDENTS_ALREADY_IN_GROUPS: ${assignedIds.join(', ')}`, 409);
        }

        // 5. Validar capacidad del grupo (Máximo 7)
        const currentCount = await prisma.groups_students.count({
            where: { group_id: groupId }
        });

        if (currentCount >= 7) {
            throw new AppError('GROUP_IS_FULL', 422);
        }

        if (currentCount + studentIds.length > 7) {
            throw new AppError(`CAPACITY_EXCEEDED: Only ${7 - currentCount} spots left.`, 422);
        }

        // 6. Validar coordinadores en request
        const coordinators = students.filter(s => s.isCoordinator);

        if (coordinators.length > 1) {
            throw new AppError('ONLY_ONE_COORDINATOR_ALLOWED', 422);
        }

        // 7. Buscar coordinador actual
        const currentCoordinator = await prisma.groups_students.findFirst({
            where: {
                group_id: groupId,
                is_coordinator: true
            }
        });

        // 8. Reglas de reemplazo
        if (coordinators.length === 1) {
            if (currentCoordinator && !replaceCoordinator) {
                throw new AppError('GROUP_ALREADY_HAS_COORDINATOR', 409);
            }
        }

        // 9. Transacción (CRÍTICO)
        await prisma.$transaction(async (tx) => {

            // Si hay que reemplazar coordinador
            if (coordinators.length === 1 && replaceCoordinator) {
                await tx.groups_students.updateMany({
                    where: {
                        group_id: groupId,
                        is_coordinator: true
                    },
                    data: {
                        is_coordinator: false
                    }
                });
            }

            await tx.groups_students.createMany({
                data: students.map(student => ({
                    id: CryptoUtil.generateUUID(),
                    group_id: groupId,
                    student_id: student.id,
                    is_coordinator: student.isCoordinator
                }))
            });

            // Actualizar estado del grupo si se llenó
            if (currentCount + studentIds.length === 7) {
                await tx.groups.update({
                    where: { id: groupId },
                    data: { group_full: true }
                });
            }

        });

        return { success: true, insertedStudents: students };
    }

    static async setNewCoordinator(studentId: string, groupId: string) {
        return await prisma.$transaction(async (tx) => {

            // 1. Validar que el estudiante pertenece al grupo
            const student = await tx.groups_students.findFirst({
                where: {
                    student_id: studentId,
                    group_id: groupId
                },
                select: {
                    student_id: true,
                    group_id: true,
                    is_coordinator: true
                }
            });

            if (!student) {
                throw new AppError("STUDENT_NOT_IN_GROUP", 404);
            }

            if (student.is_coordinator) {
                throw new AppError("STUDENT_IS_COORDINATOR", 409);
            }

            // 2. Quitar coordinador actual del grupo
            await tx.groups_students.updateMany({
                where: {
                    group_id: groupId,
                    is_coordinator: true
                },
                data: {
                    is_coordinator: false
                }
            });

            // 3. Asignar nuevo coordinador
            const updatedStudent = await tx.groups_students.update({
                where: {
                    student_id: studentId // sigue siendo unique
                },
                data: {
                    is_coordinator: true
                },
                select: {
                    group_id: true,
                    student_id: true,
                    is_coordinator: true
                }
            });

            return {
                success: true,
                newCoordinator: updatedStudent
            };
        });
    }

    static async deleteStudentFromGroup(
        studentIds: string[],
        groupId: string
    ) {
        return await prisma.$transaction(async (tx) => {

            if (studentIds.length === 0) {
                throw new AppError("EMPTY_STUDENT_LIST", 400);
            }

            // 1. Validar cuáles están en el grupo
            const studentsInGroup = await tx.groups_students.findMany({
                where: {
                    group_id: groupId,
                    student_id: { in: studentIds }
                },
                select: {
                    student_id: true
                }
            });

            const foundIds = studentsInGroup.map(s => s.student_id);
            const missingIds = studentIds.filter(id => !foundIds.includes(id));

            // 2. Eliminar solo los que sí están en el grupo
            if (foundIds.length > 0) {
                await tx.groups_students.deleteMany({
                    where: {
                        group_id: groupId,
                        student_id: { in: foundIds }
                    }
                });

                // 3. Actualizar status del grupo (ya no puede estar lleno)
                await tx.groups.update({
                    where: { id: groupId },
                    data: { group_full: false }
                });
            }

            // 4. Si hubo algunos no encontrados, devolvemos error pero persistimos la eliminación
            if (missingIds.length > 0) {
                return {
                    success: false,
                    error: "SOME_STUDENTS_NOT_IN_GROUP",
                    deletedCount: foundIds.length,
                    missingIds
                };
            }

            return {
                success: true,
                deletedCount: foundIds.length
            };
        });
    }
}

