import { Terminal, Server, Key, MousePointer2 } from "lucide-react"

export function SetupGuide() {
  const steps = [
    {
      icon: Server,
      title: "Get a VPS Server",
      desc: "Buy a VPS from Linode, DigitalOcean, or Hetzner. Recommended OS: Ubuntu 22.04 LTS with 4GB RAM.",
    },
    {
      icon: Terminal,
      title: "Find your Server IP",
      desc: "After deployment, your provider will give you an IPv4 address (e.g., 159.203.1.1). Copy this.",
    },
    {
      icon: Key,
      title: "Set Root Password",
      desc: "Ensure you have the 'root' user password. This is needed for our system to install the AI.",
    },
    {
      icon: MousePointer2,
      title: "Submit & Watch",
      desc: "Fill the form with your IP and Password. Our system will deploy OpenClaw AI automatically in 5 minutes.",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-white flex items-center gap-2">
        <Terminal className="w-5 h-5 text-violet-400" />
        Quick Setup Guide
      </div>
      <div className="grid grid-cols-1 gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-violet-500/30 transition-colors group">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                <span className="text-xs text-violet-500 font-mono">0{index + 1}.</span> {step.title}
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-300">
          <strong>Note:</strong> We never share your credentials. Everything is encrypted and only used once for the automated setup process.
        </p>
      </div>
    </div>
  )
}
