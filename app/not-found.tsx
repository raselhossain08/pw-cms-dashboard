"use client";

import * as React from "react";
import Link from "next/link";
import { Home, HelpCircle, Plane, Settings, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Plane className="text-primary w-5 h-5 -rotate-12" />
          </div>
        </div>
        <div className="absolute bottom-20 right-24">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Plane className="text-purple-600 w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10 text-center">
          <h1 className="text-9xl font-bold text-secondary mb-4">
            4<span className="text-primary">0</span>4
          </h1>
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Oops! The page you&apos;re looking for seems to have taken off to
            another destination. Don&apos;t worry, even the best pilots
            sometimes navigate to unexpected places.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Return Home</h3>
              <p className="text-sm text-gray-600 mb-4">
                Go back to the dashboard start page
              </p>
              <Link href="/" className="text-primary">
                Go to Home
              </Link>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="text-accent w-6 h-6" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Get Help</h3>
              <p className="text-sm text-gray-600 mb-4">
                Visit our help center for guidance
              </p>
              <Button variant="link" className="text-primary px-0">
                Help Center
              </Button>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">
                Explore Settings
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Adjust your platform preferences
              </p>
              <Link href="/my-settings" className="text-primary">
                Open Settings
              </Link>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-primary to-accent rounded-xl text-white max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Need Immediate Assistance?
                </h3>
                <p className="opacity-90">
                  Our support team is here to help you get back on track
                </p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-white text-primary hover:bg-gray-100">
                  Live Chat
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
          <div className="inline-flex items-center text-gray-600">
            <FileWarning className="w-4 h-4 mr-2" />
            <span className="text-sm">
              If this keeps happening, please report the issue.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
