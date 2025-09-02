import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Stripe Page",
  description: "Stripe integration demo",
}

export default function StripeLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <section className={inter.className}>
      {children}
    </section>
  )
}