import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ToastProvider } from '@/components/Toast';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const metadata = { title: 'Login Authentication System' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}" }} /></head>
      <body className={font.className}><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
