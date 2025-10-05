// app/forbidden/page.tsx
import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <main className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
            <p className="text-gray-700 mb-6 max-w-md">
                Bu sayfaya erişim yetkiniz bulunmuyor.
                Hesabınıza ait aktif bir organizasyon tanımlı olmayabilir.
            </p>
            <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
                Dashboard’a Dön
            </Link>
        </main>
    );
}
