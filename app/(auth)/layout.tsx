// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="items-center justify-center bg-gray-50">
            {children}
        </div>
    );
}
