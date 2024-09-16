import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function ratePalette(colors) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 15,
      messages: [
        {
          role: "user",
          content: `Rate this color palette on a scale of 1 to 3 based on how cool it is. 
          3 is the best, 1 is the worst.
          Only respond with the number. Give out 1's half the time, with some 2's and 3's.
          Base it off of how cohesive the colors are.
          Colors: ${colors.join(', ')}`
        }
      ],
    });
    const rating = parseInt(response.content[0].text.trim());
    return isNaN(rating) ? 1 : Math.min(Math.max(rating, 1), 3);
  } catch (error) {
    console.error("Error rating palette:", error);
    return 1; 
  }
}