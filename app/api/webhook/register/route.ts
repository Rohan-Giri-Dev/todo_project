import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if(!WEBHOOK_SECRET){
        throw new Error("Please add webhook secret in env")
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if(!svix_id || !svix_timestamp || !svix_signature){
        return new  Response("Error occured - No Svix headers")
    }

    const payload = await req.json();
    const body = JSON.stringify(payload)
    
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt : WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (error) {
        console.error("Error verifying webhook", error)
        return new Response("Error occured", {status: 400})
    }

    const {id} = evt.data
    const eventType = evt.type

    //logs

    if(eventType === "user.created"){
        try {
            const {email_addresses, primary_email_address_id} = evt.data;
            //logs
            console.log(email_addresses);
            console.log(primary_email_address_id);

            // optional
            const primaryEmail = email_addresses.find((email) => email.id === primary_email_address_id)

            if(!primaryEmail){
                return new Response("No primary email found", {status: 400})
            }

            // create a user in neon (postresql)

            const newUser = await prisma.user.create({
                data: {
                    id: evt.data.id!,
                    email: primaryEmail.email_address,
                    isSubscribed: false,
                }
            })

            console.log("New User created: ", newUser);
            
            
        } catch (error) {
            return new Response('Error creating an user in database', {status: 400})
        }
    }

    return new Response("Webhook recived successfully", {status: 200});


    
}

/*
When something happens in Clerk, Clerk sends your app a message.
Example: user created, user updated, user deleted.
Your app receives that message here and updates your database with Prisma.

we use svix becuase it helps to verify that this request came from clerk only

2)
import { headers } from "next/headers";
this reads the request headers in a Next.js route handler
clerk sends speical headers to verify the webhook

svix-id
svix-timestamp
svix-signature

3)
import { WebhookEvent } from "@clerk/nextjs/server";
This lets you do the clerk webhook events

Example event types:
"user.created"
"user.updated"
"user.deleted"

4)
We imported prisma to save/update/delete the user in the database

5)
All the headers comes from the clerk
The headaer is an special object 
that why we have to get the data as headers.get("svix-id")

we have this secrect (const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;)
thats the reason it is safe from attackers

6)
Create the webhook verifier
const wh = new Webhook(WEBHOOK_SECRET);

This creates a verifier object.

Meaning: I have the secret. Now I can verify whether this webhook request is real.

*/



/*
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

  This route is a Clerk webhook receiver.

  A webhook means:
  Clerk sends a request to our backend automatically when something happens
  inside Clerk.

  Example:
  - A user signs up in Clerk
  - Clerk creates that user in Clerk's system
  - Clerk sends a POST request to this route
  - This route receives that data
  - Then we create the same user in our own database using Prisma

  Important:
  This route is not called by our frontend.
  Clerk calls this route from its own server.


export async function POST(req: Request) {
  /*
    WEBHOOK_SECRET is a private secret key given by Clerk/Svix.

    Why do we need it?
    Because anyone can technically send a POST request to this URL.
    So before trusting the request, we must verify that it really came from Clerk.

    This secret should be stored in .env, not written directly in the code.

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET in .env");
  }


    Clerk sends special verification headers with every webhook request.

    These headers are not the actual user data.
    These headers are used to prove that the request is really from Clerk/Svix.

    The important headers are:
    - svix-id
    - svix-timestamp
    - svix-signature

    We read them using headers() from Next.js.
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");


    If these headers are missing, we should not trust the request.

    A real Clerk webhook request should contain these headers.
    A random request sent by someone else may not have them.

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  
    Read the raw body of the request.

    Important:
    For webhook verification, we should use req.text(), not req.json().

    Why?
    Because the signature is created from the exact raw body.
    If we parse the body using req.json() and then stringify it again,
    the body may not be exactly the same as the original request body.
    That can cause verification to fail.
  
  const body = await req.text();

  
    Create a webhook verifier using our WEBHOOK_SECRET.

    Meaning:
    "I have the secret key. Now I can check whether this webhook request
    really came from Clerk/Svix."
  
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    
      Verify the webhook request.

      This checks:
      - the request body
      - the svix-id
      - the svix-timestamp
      - the svix-signature
      - our WEBHOOK_SECRET

      If the request is real, wh.verify() returns the webhook event.
      If the request is fake or modified, wh.verify() throws an error.
    
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook:", error);

    
      If verification fails, stop here.
      We should not read or save any data from an unverified request.
    
    return new Response("Invalid webhook signature", { status: 400 });
  }

  
    After verification is successful, we can trust evt.

    evt.type tells us what happened in Clerk.

    Examples:
    - "user.created"  -> a new user signed up
    - "user.updated"  -> user details changed
    - "user.deleted"  -> user was deleted

    evt.data contains the actual data related to that event.
    For "user.created", evt.data contains the new Clerk user data.
  
  const eventType = evt.type;

  
    Here we only handle the "user.created" event.

    Meaning:
    This code runs only when a new user is created in Clerk.

  if (eventType === "user.created") {
    try {
      
        For a user.created event, Clerk sends user information inside evt.data.

        We need:
        - id: Clerk's unique user ID
        - email_addresses: list of emails connected to this user
        - primary_email_address_id: the ID of the user's main email

        A Clerk user can have multiple email addresses,
        so we need to find which one is the primary email.

      const { id, email_addresses, primary_email_address_id } = evt.data;

      console.log("All email addresses:", email_addresses);
      console.log("Primary email ID:", primary_email_address_id);

      
        Find the primary email object.

        email_addresses is an array.
        primary_email_address_id is just an ID.

        So we search inside email_addresses and find the email whose id
        matches primary_email_address_id.

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      
        If we cannot find the primary email, we should not create the user.

        Why?
        Because our database user needs an email.
        Creating a user without an email can cause problems later.

      if (!primaryEmail) {
        return new Response("No primary email found", { status: 400 });
      }

      
        Create a user in our own database.

        Clerk stores the user in Clerk's database.
        But our app also needs a user record in our own database.

        Why?
        Because our app may need to store app-specific data like:
        - subscription status
        - user role
        - credits
        - profile settings
        - app permissions

        Here we save:
        - id: Clerk user ID
        - email: user's primary email
        - isSubscribed: false by default because the user has just signed up

      const newUser = await prisma.user.create({
        data: {
          id,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      console.log("New user created in database:", newUser);
    } catch (error) {
      console.error("Error creating user in database:", error);

      
        If something goes wrong while saving to the database,
        return an error response.

      return new Response("Error creating user in database", { status: 400 });
    }
  }

  
    If everything worked, return 200.

    This tells Clerk:
    "Webhook received successfully."

    If Clerk gets a successful response, it knows our app received the event.

  return new Response("Webhook received successfully", { status: 200 });
}

 */