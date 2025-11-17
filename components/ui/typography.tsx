import { cn } from "@/lib/utils"
import * as React from "react"

function H1({ children, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", props.className)}
      {...props}
    >
      {children}
    </h1>
  )
}

function H2({ children, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", props.className)}
      {...props}
    >
      {children}
    </h2>
  )
}

function H3({ children, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", props.className)}
      {...props}
    >
      {children}
    </h3>
  )
}

function H4({ children, ...props }: React.ComponentProps<'h4'>) {
  return (
    <h4
      className={cn("scroll-m-20 text-xl font-semibold tracking-tight", props.className)}
      {...props}
    >
      {children}
    </h4>
  )
}

function P({ children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", props.className)}
      {...props}
    >
      {children}
    </p>
  )
}

function Blockquote({ children, ...props }: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", props.className)}
      {...props}
    >
      {children}
    </blockquote>
  )
}

function List({ children, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", props.className)}
      {...props}
    >
      {children}
    </ul>
  )
}

function InlineCode({ children, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", props.className)}
      {...props}
    >
      {children}
    </code>
  )
}

function Lead({ children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn("text-muted-foreground text-xl", props.className)}
      {...props}
    >
      {children}
    </p>
  )
}

function Large({ children, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("text-lg font-semibold", props.className)} {...props}>{children}</div>
}

function Small({ children, ...props }: React.ComponentProps<'small'>) {
  return (
    <small className={cn("text-sm leading-none font-medium", props.className)} {...props}>{children}</small>
  )
}

function Muted({ children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn("text-muted-foreground text-sm", props.className)} {...props} >{children}</p>
  )
}

export {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  List,
  InlineCode,
  Lead,
  Large,
  Small,
  Muted,
}