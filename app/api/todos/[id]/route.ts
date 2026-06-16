import { NextResponse, NextRequest } from "next/server";
import {auth} from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest,{params} : {params: {id: string}}){
    const {userId} = await auth()

    if (!userId) {return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    try {
        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: {
                id: todoId,
            }
        })


    if (!todo) {return NextResponse.json(
      { error: "Todo not found" },
      { status: 401 }
    );
    }

    if(todo.userId !== userId){
        return NextResponse.json(
      { error: "Forbinnden" },
      { status: 403 }
    );
    }

    await prisma.todo.delete({
        where: { id: todoId}
    })

    return NextResponse.json(
      { message : "SUcessfully deleted todo" },
      { status: 403 }
    );



    } catch (error) {
        console.log('Error deleting the Todos', error);
        return NextResponse.json({
            error: "Internal server error"
        })
    }
}