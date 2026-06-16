import { NextResponse, NextRequest } from "next/server";
import {auth} from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma";

export async function POST(){
    const {userId} = await auth()

     if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    //capture payment
    try {
        const user =  await prisma.user.findUnique({where:
             {id: userId}
        })

         if(!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );  
        }

        const subscriptionEnds = new Date()
        // adding 1 month to the subscription
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)

        const updatedUser = await prisma.user.update(
            {
                where: {
                    id: userId,
                },
                data: {
                    isSubscribed: true,
                    subscriptionEnds: subscriptionEnds,
                }
            }
        )

        return NextResponse.json({message: "Subscription successfully added", subscriptionEnds: updatedUser.subscriptionEnds},
        )

    } catch (error) {
        console.log('Error updating subscription', error);
        return NextResponse.json({
            error: "Internal server error"
        })
        
    }
}


export async function GET(){}




/*
Common values inside auth() are:

const {
  userId,
  sessionId,
  orgId,
  orgRole,
  orgSlug,
  sessionClaims,
  actor,
  redirectToSignIn,
  protect,
} = await auth();

*/