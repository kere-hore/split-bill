import axios from "axios";

export interface SlackMessage {
  text: string;
  blocks?: any[];
}

export interface SlackUserMapping {
  id: string;
  userId?: string;
  groupId: string;
  memberName: string;
  memberEmail?: string;
  slackUsername?: string;
  mappingStatus: "pending" | "active" | "skipped";
}

export async function sendToSlackWebhook(
  webhookUrl: string,
  message: SlackMessage
): Promise<boolean> {
  try {
    const response = await axios.post(webhookUrl, message, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
    return response.status === 200;
  } catch (error) {
    console.error("Slack webhook error:", error);
    return false;
  }
}

export function generateSlackMessage(
  groupData: any,
  mappingLookup: Map<string, string>,
  nameMappingLookup?: Map<string, string>,
  emailMappingLookup?: Map<string, string>
): SlackMessage {
  const memberList = groupData.members
    .map((member: any) => {
      // Try userId mapping first, then name mapping
      let slackUsername = mappingLookup.get(member.user?.id);

      // Try email mapping
      if (!slackUsername && emailMappingLookup) {
        const memberEmail = (member.user?.email || "").toLowerCase();
        if (memberEmail) {
          slackUsername = emailMappingLookup.get(memberEmail);
          if (slackUsername) {
            console.log(`Email match found: '${memberEmail}'`);
          }
        }
      }

      // Try name mapping
      if (!slackUsername && nameMappingLookup) {
        const memberName = (member.user?.name || member.name).toLowerCase();

        // Try exact match first
        slackUsername = nameMappingLookup.get(memberName);

        // If no exact match, try fuzzy matching
        if (!slackUsername) {
          for (const [mappedName, slackId] of nameMappingLookup.entries()) {
            // Check if names contain similar parts
            const memberParts = memberName.split(/\s+/);
            const mappedParts = mappedName.split(/\s+/);

            // If any significant part matches (length > 3)
            const hasMatch = memberParts.some(
              (part: string) =>
                part.length > 3 &&
                mappedParts.some(
                  (mappedPart: string) =>
                    mappedPart.includes(part) || part.includes(mappedPart)
                )
            );

            if (hasMatch) {
              slackUsername = slackId;
              console.log(
                `Fuzzy match found: '${memberName}' matched with '${mappedName}'`
              );
              break;
            }
          }
        }
      }

      if (slackUsername) {
        let identifier = slackUsername.trim();

        // Remove @ if present
        if (identifier.startsWith("@")) {
          identifier = identifier.substring(1);
        }

        // Only create proper mention if it's a valid User ID
        if (identifier.startsWith("U") && identifier.length >= 9) {
          return `• <@${identifier}>`;
        }
      }

      // Fallback to member name (no mention)
      const result = `• ${member.user?.name || member.name}`;
      console.log(`Member result: ${result}`);
      return result;
    })
    .join("\n");

  const merchantName = groupData.bill?.merchantName || "Split Bill";
  const totalAmount = formatCurrency(groupData.bill?.totalAmount || 0);
  const publicUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://split-bill-mu.vercel.app"
  }/public/bills/${groupData.id}`;

  const message = {
    text: `🍕 *${merchantName} Split Bill*\nTotal: ${totalAmount}\n\n💰 *Member Breakdown:*\n${memberList}\n\n📋 View Details: ${publicUrl}`,
  };

  return message;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
