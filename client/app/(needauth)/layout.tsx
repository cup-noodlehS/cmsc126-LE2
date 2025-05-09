import AuthMiddleware from "@/components/layout/AuthMiddleware";

export default function NeedAuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthMiddleware>{children}</AuthMiddleware>
    )
}