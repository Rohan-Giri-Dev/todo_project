import { NextResponse } from "next/server";
import {auth, clerkClient} from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma";

export async function GET(){
    const {userId} = await auth();

     if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    try {

       const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {isAdmin: true}
        })

        if (!user || !user.isAdmin) {
            return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        );
    }

    const totalUsers = await  prisma.user.count()
    const totalTodo = await prisma.todo.count()
    const totalSubscribed = await prisma.user.count({
        where: {
            isSubscribed: true,
        },
    })
    const recentUsers = await prisma.user.findMany({
        orderBy: {
            id: "desc"
        },
        take: 10,
        select: {
                id: true,
                email: true,
                isSubscribed: true,
                isAdmin: true,
        }
    })

    return NextResponse.json({
        totalUsers,
        totalTodo,
        totalSubscribed,
        recentUsers
    })

        
    } catch (error) {
        console.log('Error Fetching data for admin', error);
        return NextResponse.json({
            error: "Internal server error"
        })
    }
}