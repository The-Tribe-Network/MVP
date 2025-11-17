import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn, getInitials } from "@/lib/utils";
import { BetterAuthUser } from "@/lib/@types/auth";
import { DEFAULT_USER_IMAGE } from "@/lib/constants/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps
  extends Pick<BetterAuthUser, "image" | "name" | "email">,
  React.ComponentProps<typeof AvatarPrimitive.Root> { }

export function UserAvatar({
  image,
  email,
  name,
  className,
  ...props
}: UserAvatarProps) {
  const userName = name ? name : email || "Not Applicable";
  const userAvatar = image || DEFAULT_USER_IMAGE;
  const userInitals = getInitials(userName);

  return (
    <Avatar className={cn("h-8 w-8 rounded-lg", className)} {...props}>
      <AvatarImage src={userAvatar} alt={userName} />
      <AvatarFallback className="rounded-lg">{userInitals}</AvatarFallback>
    </Avatar>
  );
}

export function UserAvatarWithName({ name, email, image, className, ...props }: UserAvatarProps) {
  return (
    <>
      <UserAvatar image={image} email={email} name={name} className={className} {...props} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </>
  )
}
