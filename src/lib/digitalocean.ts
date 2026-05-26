const DO_API_URL = "https://api.digitalocean.com/v2";

export interface DropletResponse {
  id: number;
  name: string;
  status: string;
}

/**
 * Creates a new DigitalOcean Droplet (VPS) for the user.
 */
export async function createDroplet(userName: string): Promise<DropletResponse> {
  const token = process.env.DIGITALOCEAN_API_KEY;
  // SSH key ID so our system can log into the newly created VPS securely
  const sshKeyId = process.env.DIGITALOCEAN_SSH_KEY_ID; 

  if (!token) throw new Error("DIGITALOCEAN_API_KEY is not set in environment variables.");

  // Generate a safe unique name for the server
  const safeName = `ai-node-${userName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}-${Date.now()}`;

  const response = await fetch(`${DO_API_URL}/droplets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: safeName,
      region: "nyc1", // New York data center (fast and reliable)
      size: "s-2vcpu-4gb", // 4GB RAM, 2 CPUs (Recommended for AI)
      image: "ubuntu-22-04-x64",
      ssh_keys: sshKeyId ? [Number(sshKeyId)] : [],
      tags: ["openclaw", "auto-deployed"],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`DigitalOcean Error: ${errorData}`);
  }

  const data = await response.json();
  return {
    id: data.droplet.id,
    name: data.droplet.name,
    status: data.droplet.status,
  };
}

/**
 * DigitalOcean takes a minute to assign an IP address after creating the droplet.
 * This function waits and checks until the IP is assigned.
 */
export async function waitForDropletIp(dropletId: number, maxAttempts = 15): Promise<string> {
  const token = process.env.DIGITALOCEAN_API_KEY;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${DO_API_URL}/droplets/${dropletId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store"
    });

    if (response.ok) {
      const data = await response.json();
      
      // Check if it has a public IPv4 address assigned
      if (data.droplet.networks && data.droplet.networks.v4) {
        const publicIp = data.droplet.networks.v4.find((network: any) => network.type === "public");
        if (publicIp && publicIp.ip_address) {
          return publicIp.ip_address;
        }
      }
    }

    // Wait 10 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  throw new Error("Timeout: VPS created but IP address was not assigned in time.");
}
