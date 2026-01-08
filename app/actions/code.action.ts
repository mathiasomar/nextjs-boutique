// "use server";

// import prisma from "@/lib/prisma";

// export const getCode = async () => {
//   try {
//     const code = await prisma.UserCode.findMany();

//     return { success: true, code };
//   } catch (error) {
//     console.error("Error fetching code:", error);
//     return { error: "Error fetching code" };
//   }
// };
