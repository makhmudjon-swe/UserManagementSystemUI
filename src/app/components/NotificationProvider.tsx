import { Toaster } from 'sonner';

export function NotificationProvider() {
  return (
    <Toaster 
      position="top-right"
      richColors
      expand={true}
      visibleToasts={3}
      duration={4000}
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  );
}