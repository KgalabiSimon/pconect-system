"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, Send, Lock, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginHelpPage() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Login Assistance Required");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Open default email client with pre-filled subject and body
    const mailtoLink = `mailto:support@pconect.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;

    // Show success message
    setShowSuccess(true);
    setMessage("");

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const loginIssues = [
    {
      title: "Forgot Password",
      description: "Can't remember your password?",
      icon: Lock,
      solution: "Click 'Forgot Password' on the login page to reset it via email.",
    },
    {
      title: "Account Locked",
      description: "Too many failed login attempts?",
      icon: Lock,
      solution: "Contact support to unlock your account. We'll verify your identity first.",
    },
    {
      title: "Email Not Recognized",
      description: "System doesn't recognize your email?",
      icon: User,
      solution: "Make sure you're using the correct email. If you're new, create an account first.",
    },
    {
      title: "Registration Issues",
      description: "Having trouble creating an account?",
      icon: User,
      solution: "Contact support for assistance with registration and account setup.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/login" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Login Help & Support
        </h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center gap-2 text-green-700">
            <Send className="w-5 h-5" />
            <span>Message sent successfully! We'll get back to you soon.</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Alert Banner */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Need Help Logging In?</h3>
              <p className="text-sm text-gray-700">
                We're here to help you get back into your account. Check the common issues below or contact us directly.
              </p>
            </div>
          </div>
        </Card>

        {/* Common Login Issues */}
        <h2 className="text-xl font-bold mb-4">Common Login Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {loginIssues.map((issue, index) => {
            const Icon = issue.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  <strong>Solution:</strong> {issue.solution}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Quick Contact */}
        <h2 className="text-xl font-bold mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a href="mailto:support@pconect.com" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                <p className="text-sm font-medium text-primary">support@pconect.com</p>
              </div>
            </Card>
          </a>

          <a href="tel:+27742450193" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-3">Call us for immediate help</p>
                <p className="text-sm font-medium text-primary">+27 74 245 0193</p>
              </div>
            </Card>
          </a>

          <a
            href="https://wa.me/27742450193"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-600 mb-3">Chat with us on WhatsApp</p>
                <p className="text-sm font-medium text-green-600">Start WhatsApp Chat</p>
              </div>
            </Card>
          </a>
        </div>

        {/* Contact Form */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                placeholder="Describe your login issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" className="w-full h-12 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Send Message
            </Button>
          </form>
        </Card>

        {/* Back to Login */}
        <Link href="/login" className="block">
          <Button variant="outline" className="w-full h-12">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
