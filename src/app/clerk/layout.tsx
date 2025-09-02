import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Clerk Page",
  description: "Clerk integration demo",
}
export default function ClerkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
        <section className={inter.className}>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
                    <SignedOut>
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal" />
                    </SignedOut>
                    <SignedIn>
                    <UserButton />
                    </SignedIn>
            </header>
            {children}
        </section>
    </ClerkProvider>
  );
}