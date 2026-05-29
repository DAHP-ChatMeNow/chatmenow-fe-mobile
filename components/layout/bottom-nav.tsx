import { MessageSquare, Users, Compass, User } from "lucide-react"
import Link from "next/link"

const navItems = [
  { icon: MessageSquare, label: "Messages", href: "/messages", active: true },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: Compass, label: "Discover", href: "/discover" },
  { icon: User, label: "Me", href: "/profile" },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-white/80 backdrop-blur-md max-w-md mx-auto w-full">
      <div className="flex h-full items-center justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <item.icon className={`h-6 w-6 ${item.active ? "text-blue-600" : "text-gray-400"}`} />
            <span className={`text-[10px] font-medium ${item.active ? "text-blue-600" : "text-gray-400"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}