# AI Approach

## Model
Groq + llama-3.3-70b-versatile. Fast, free tier works fine, and 
response_format: json_object means I don't have to strip markdown 
from the output.

temperature: 0.1 because this is extraction, not generation. 
Lower temperature = model stays closer to what's actually in the transcript.

## Prompt design
System prompt handles the grounding rules — only use what's in the 
transcript, every item needs a citation, return JSON only. Putting 
constraints in the system prompt rather than the user prompt gets 
better compliance.

User prompt shows the target JSON structure as a concrete example 
rather than describing it. Model follows examples better than schema descriptions.

## Citation grounding
Two checks run after every AI response before anything hits the database:

1. Every item must have at least one citation — empty citations mean 
   the model guessed
2. Every cited timestamp must actually exist in the transcript — 
   catches cases where the model invents a plausible-looking timestamp

If either check fails, the whole analysis errors out. Client can retry.

## Known limitations
- Validates timestamp existence, not whether the summary is accurate. 
  The model could cite a real timestamp but misrepresent what was said.
- No auto-retry on validation failure — should add one but didn't get to it.
- Follow-up suggestions are the weakest section since they need 
  inference beyond what's explicitly stated.

