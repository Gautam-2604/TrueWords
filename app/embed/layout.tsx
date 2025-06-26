
import '../globals.css'
import './embed.css' 

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="embed-body">
        {children}
      </body>
    </html>
  )
}