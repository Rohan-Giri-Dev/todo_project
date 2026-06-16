import { NextResponse, NextRequest } from "next/server";
import {auth} from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma";


const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest){
    const {userId} = await auth()

     if (!userId) {return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    const {searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""

    try {
        const todos = await prisma.todo.findMany({
            where:{
                userId,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            orderBy: {createdAt: "desc"},
            take: ITEMS_PER_PAGE,
            skip : (page-1) * ITEMS_PER_PAGE ,

        })

        const totalItems = await prisma.todo.count({
            where: {
                userId,
                title: {
                    contains: "search",
                    mode: "insensitive"
                }
            }
        })

        const totalPages = Math.ceil(totalItems/ ITEMS_PER_PAGE)

        return NextResponse.json({
            todos,
            currentPage: page,
            totalPages
        })
    } catch (error) {
        console.log('Error Gettin the Todos', error);
        return NextResponse.json({
            error: "Internal server error"
        })
    }
}


export async function POST(req: NextRequest){
    const {userId} = await auth()

     if (!userId)
    {   return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
    );
    }

    const user =await prisma.user.findUnique({
        where: {
            id : userId
        },
        include: {todos: true}
    })

    console.log(user);

    if(!user){
        return NextResponse.json({error: "User not found"}, {status: 404})
    }

    if(!user.isSubscribed && user.todos.length >= 3){
        return NextResponse.json({
            error: 'Free users can only create upto 3 Todos. Please subscribe to our paid plan to write more todos'
        }, {status: 401})
    }

    const {title} = await req.json()

    const todo = await prisma.todo.create({
        data: {title, userId},
    })
    
}




/*
req.url 
gives url like this 
eg: http://localhost:3000/api/products?page=2&search=laptop

const page = parseInt(searchParams.get("page") || "1")
from this we are getting the page form the url and converting it into numbers 

const search = searchParams.get("search") || ""
From this we are extracting the search 
like from the above url 
search = laptop



*/