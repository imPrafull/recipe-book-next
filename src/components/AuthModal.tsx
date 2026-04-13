'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const defaultMessage = "Sign in to unlock full access 🍳";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center flex flex-col items-center p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2 text-center">Login Required</DialogTitle>
          <DialogDescription className="text-lg text-center">
            {message || defaultMessage}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 w-full mt-6">
          <Button asChild size="lg" className="w-full text-md">
            <Link href="/login" onClick={onClose}>
              Log In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full text-md">
            <Link href="/signup" onClick={onClose}>
              Create an Account
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
