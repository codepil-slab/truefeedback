"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useCompletion } from 'ai/react'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { messageSchema } from "@/schemas/messageSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"


const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar);
};

const initialMessageString =
    "What's your favorite movie?||Do you have any pets?||What's your dream job?";


const SendFeedbackPage = ({ params }: { params: { username: string } }) => {


    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        }
    });
    const messageContent = form.watch("content")
    const username = params.username;
    const [isLoading, setIsLoading] = useState(false);

    // ai message suggestions 
    const {
        complete,
        completion,
        isLoading: isSuggestMessagesLoading,
        error
    } = useCompletion({
        api: "/api/suggest-messages",
        initialCompletion: initialMessageString,
    })


    const handleMessageClick = (message: string) => {
        form.setValue("content", message);
    }

    const fetchSuggestedMessages = async () => {
        try {
            complete("");
        } catch (error) {
            console.log("Error fetching suggested messages", error);
        }
    }



    // message sending
    const onSubmit = async (data: z.infer<typeof messageSchema>) => {

        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>(`/api/send-message`, {
                ...data,
                username,
            })
            toast({
                title: `Message sent successfully to ${username}`,
            })
            form.reset();
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.message || `Failed to send message to ${username}`,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="flex justify-center items-center flex-col w-full mt-5">
            <section className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-bold">
                    Public Profile Link
                </h1>
            </section>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6 flex flex-col justify-center mb-4">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Anonymous Feedback to @{username}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your anonymous feedback here"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        {isLoading ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isLoading || !messageContent}>
                                Send It
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <div className="space-y-4 my-8 w-full max-w-4xl">
                <div className="space-y-2">
                    <Button
                        onClick={fetchSuggestedMessages}
                        className="my-4"
                        disabled={isSuggestMessagesLoading}
                    >
                        Suggest Messages
                    </Button>
                    <p>Click on any message below to select it.</p>
                </div>
                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold">Messages</h3>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4">
                        {error ? (
                            <p className="text-red-500">{error.message}</p>
                        ) : (
                            parseStringMessages(completion).map((message, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="mb-2"
                                    onClick={() => handleMessageClick(message)}
                                >
                                    {message}
                                </Button>
                            ))
                        )}
                    </CardContent>
                </Card>
                <Separator />
            </div>
            <section className="text-center mb-8 md:mb-12 mt-5">
                <h1 className="font-bold mb-4">
                    Get your Message Board
                </h1>
                <Link href="/sign-up">
                    <Button>Create Your Account</Button>
                </Link>
            </section>
        </div>
    )
}

export default SendFeedbackPage