import { StudentService } from "./src/services/students.service";
import { sections } from "@prisma/client";
async function run() {
    try {
        console.log("Creating student...");
        const res = await StudentService.createStudent({
            list_number: 1,
            name: "John",
            last_name: "Doe",
            section: sections.A
        });
        console.log("Success:", res);
    } catch(e) {
        console.error("Error creating student!!!");
        console.error(e);
    }
}
run();
