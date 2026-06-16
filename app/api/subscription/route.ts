import { NextResponse, NextRequest } from "next/server";
import {auth} from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma";
import { Select } from "radix-ui";

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


export async function GET(){
    const {userId} = await auth()

     if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    try {
        const user =  await prisma.user.findUnique(
            {where:{id: userId},
         select: { 
            isSubscribed: true,
            subscriptionEnds: true,
         }}, 
        )

         if(!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );  
        }

        const now = new Date();

        if(user.subscriptionEnds && user.subscriptionEnds < now){
            await prisma.user.update({
                where: {id: userId},
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null,
                }
            });

            return NextResponse.json({
                isSubscribed: false,
                subscriptionEnds: null

            })
        }

         return NextResponse.json({
                isSubscribed: user.isSubscribed,
                subscriptionEnds: user.subscriptionEnds

            })

    } catch (error) {
        console.log('Error updating subscription', error);
        return NextResponse.json({
            error: "Internal server error"
        })
    }
}




/*

1) 
we are using auth() for getting the userId because here we are using clerk for the aunthication 
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