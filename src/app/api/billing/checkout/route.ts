import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!plan || !['basic', 'pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Lemon Squeezy API Key");
    }

    const storeId = "380349";

    const variantIds: Record<string, string> = {
      basic: "1674455",
      pro: "1674595",
      business: "1674601",
    };

    const variantId = variantIds[plan];

    console.log(`Creating Lemon Squeezy checkout for email ${userEmail}, plan ${plan}, variant ${variantId}`);

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`;

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: {
                email: userEmail,
                plan: plan
              }
            },
            product_options: {
              redirect_url: redirectUrl,
              receipt_button_text: "Go to Dashboard",
              receipt_link_url: redirectUrl
            }
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId
              }
            },
            variant: {
              data: {
                type: "variants",
                id: variantId.toString()
              }
            }
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Lemon Squeezy checkout error details:", data);
      throw new Error(data.errors?.[0]?.detail || "Failed to create checkout");
    }

    const checkoutUrl = data.data.attributes.url;
    console.log(`Lemon Squeezy checkout created: ${checkoutUrl}`);

    return NextResponse.json({ success: true, url: checkoutUrl });
  } catch (error: any) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
