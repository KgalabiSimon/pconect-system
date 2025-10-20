"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
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
    setSubject("");
    setMessage("");

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const supportOptions = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: Mail,
      action: "support@pconect.com",
      href: "mailto:support@pconect.com",
    },
    {
      title: "Phone Support",
      description: "Call us for immediate help",
      icon: Phone,
      action: "+27 74 245 0193",
      href: "tel:+27742450193",
    },
    {
      title: "Live Chat",
      description: "Chat with us on WhatsApp",
      icon: MessageCircle,
      action: "Start WhatsApp Chat",
      href: "https://wa.me/27742450193",
    },
  ];

  const faqItems = [
    {
      question: "How do I check in?",
      answer: "Go to Check-in/out from the home page, select your floor and block, provide laptop details if applicable, and click CHECK IN.",
    },
    {
      question: "How do I book a space?",
      answer: "Navigate to Bookings, select your building, booking type, and date. Then choose from available spaces and confirm your booking.",
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, go to My Bookings, select the booking you want to cancel, and click the Cancel button. Note the cancellation policy for your booking type.",
    },
    {
      question: "How do I view my booking history?",
      answer: "From the menu, select 'Booking History' to see all your past bookings with analytics.",
    },
    {
      question: "What if I forgot my password?",
      answer: "On the login page, click 'Forgot Password' and enter your email. You'll receive a password reset link.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="text-primary p-1 -ml-1">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Support & Help
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
        {/* Support Options */}
        <h2 className="text-xl font-bold mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            const isWhatsApp = option.title === "Live Chat";
            return (
              <a
                key={index}
                href={option.href}
                className="block"
                target={isWhatsApp ? "_blank" : undefined}
                rel={isWhatsApp ? "noopener noreferrer" : undefined}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full ${isWhatsApp ? 'bg-green-100' : 'bg-primary/10'} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${isWhatsApp ? 'text-green-600' : 'text-primary'}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <p className={`text-sm font-medium ${isWhatsApp ? 'text-green-600' : 'text-primary'}`}>{option.action}</p>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Contact Form */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                type="text"
                placeholder="What do you need help with?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                placeholder="Describe your issue or question..."
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

        {/* FAQ Section */}
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">{item.question}</h4>
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2">Need Immediate Assistance?</h3>
          <p className="text-sm text-gray-700 mb-3">
            For urgent issues, please call our support hotline during business hours
            (Monday - Friday, 8:00 AM - 5:00 PM):
          </p>
          <a
            href="tel:+27742450193"
            className="text-primary font-semibold text-lg hover:underline"
          >
            +27 74 245 0193
          </a>
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-sm text-gray-700 mb-2">Or chat with us on WhatsApp:</p>
            <a
              href="https://wa.me/27742450193"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 font-semibold hover:underline"
            >
              <MessageCircle className="w-5 h-5" />
              +27 74 245 0193
            </a>
          </div>
        </Card>

        {/* Back Button */}
        <Link href="/" className="block mt-6">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
