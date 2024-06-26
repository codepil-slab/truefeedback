"use client"


import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { singInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'

const SignIn = () => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast()
    const router = useRouter();
    console.log("re rendering sign in ")

    // zod implementation

    const form = useForm<z.infer<typeof singInSchema>>({
        resolver: zodResolver(singInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        }
    });

    const onSubmit = async (data: z.infer<typeof singInSchema>) => {
        setIsSubmitting(true);
        const result = await signIn("credentials", {
            identifier: data.identifier,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            if (result.error === "CredentialsSignin") {
                toast({
                    title: "Sign In Failed",
                    description: "Incorrect username or password",
                    variant: "destructive",
                })
            }
            else {
                toast({
                    title: "Sign In Failed",
                    description: result.error,
                    variant: "destructive",
                })
            }
        }
        setIsSubmitting(false);
        if (result?.url) {
            router.replace("/dashboard");
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-800'>
            <div className="w-full max-w-md p-8 space-y-3 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Welcome Back to Anonymous Feedback
                    </h1>
                    <p className="mb-4">Sign in to continue your secret conversations</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email or username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} className='w-full'>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : ("Sign In")
                            }
                        </Button>
                    </form>

                </Form>
                <div className="text-center mt-4">
                    <p>
                        New to Anonymous Feedback?{" "}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignIn