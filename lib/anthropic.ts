import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

const SCAN_SYSTEM_PROMPT = `Tu es un analyste stratégique d'opportunités business digitales.
Tu identifies des projets CONCRETS qu'un non-technique peut lancer CETTE SEMAINE avec Claude Code (Opus 4.6, Sonnet 4.6).

CAPACITÉS CLAUDE CODE MARS 2026 :
- Apps full-stack (Next.js, React, Supabase, Stripe) en 1-3 jours
- Extensions Chrome, bots Telegram/Discord/Slack
- API IA (OpenAI, Anthropic, open-source)
- Déploiement Vercel/Railway/Render
- MCP servers, agents, computer use
- Contexte 1M tokens, SWE-bench ~80%

MISSION : Recherche web pour signaux RÉELS puis propose des projets.

SOURCES : actualités tech 30j, réglementations (EU AI Act août 2026), plaintes Reddit/forums, nouvelles technos, tendances micro-SaaS, offres emploi, app stores catégories porteuses.

PATTERNS : brique manquante, pont réglementaire, automatisation, niche ignorée, arbitrage techno.

Réponds UNIQUEMENT en JSON valide sans backticks :
{
  "scan_date": "YYYY-MM-DD",
  "market_pulse": "3 phrases tendances macro",
  "opportunities": [{
    "id": 1,
    "name": "Nom",
    "tagline": "10 mots max",
    "signal_type": "reglementation|tendance|friction|techno|demande",
    "justification": {
      "signal": "Actualité PRÉCISE avec source",
      "timing": "Pourquoi maintenant",
      "market_proof": "Données chiffrées"
    },
    "project": {
      "description": "Description précise",
      "target_user": "Qui paie et combien",
      "revenue_model": "Modèle + prix",
      "mvp_features": ["F1", "F2", "F3"],
      "stack": "Stack",
      "build_time": "Temps Claude Code",
      "monthly_potential": "$X-Y/mois"
    },
    "scores": {
      "urgence": 8,
      "faisabilite": 9,
      "rentabilite": 7,
      "competition": 8,
      "timing": 9
    }
  }]
}

4-5 opportunités triées par score total décroissant. Vrais chiffres. Réalisable < 2 semaines avec Claude Code.`;

export async function runOpportunityScan(): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 16000,
    system: SCAN_SYSTEM_PROMPT,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 10,
      } as any,
    ],
    messages: [
      {
        role: 'user',
        content:
          "Effectue une recherche web approfondie sur les opportunités business digitales de cette semaine (mars 2026). Analyse les tendances, réglementations, frictions utilisateurs et nouvelles technologies. Puis génère ton rapport JSON avec 4-5 opportunités concrètes.",
      },
    ],
  });

  // Extract text content from response
  let textContent = '';
  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text;
    }
  }

  return textContent;
}

const BRIEF_SYSTEM_PROMPT = `Tu es un architecte logiciel expert en micro-SaaS.
Tu génères des MEGA-PROMPTS complets pour Claude Code.

Le mega-prompt doit contenir TOUT ce qu'il faut pour que Claude Code construise le projet de A à Z :
- Contexte business complet
- Stack technique précise
- CHAQUE fonctionnalité détaillée (avec chaque champ de formulaire, chaque bouton)
- CHAQUE écran/page décrit (layout, composants, navigation)
- Parcours utilisateur complet (étape par étape)
- Modèle de monétisation (prix, plans, Stripe config)
- Style visuel détaillé (couleurs HEX, fonts, arrondis, espacements)
- Instructions de déploiement (Vercel, Supabase, variables d'env)
- Structure des fichiers recommandée

Le prompt doit faire 500+ mots et être directement copiable dans Claude Code.
Commence par "Construis une application web complète appelée..."
Sois ULTRA précis. Pas de vague. Chaque détail compte.

Réponds UNIQUEMENT avec le mega-prompt, sans JSON, sans backticks, sans explication.`;

export async function generateBrief(opportunity: any): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 8000,
    system: BRIEF_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Génère le mega-prompt Claude Code complet pour ce projet :

NOM : ${opportunity.name}
TAGLINE : ${opportunity.tagline}
DESCRIPTION : ${opportunity.project.description}
CIBLE : ${opportunity.project.target_user}
MODÈLE REVENUS : ${opportunity.project.revenue_model}
FEATURES MVP : ${opportunity.project.mvp_features.join(', ')}
STACK : ${opportunity.project.stack}
TEMPS BUILD : ${opportunity.project.build_time}
POTENTIEL : ${opportunity.project.monthly_potential}

SIGNAL : ${opportunity.justification.signal}
TIMING : ${opportunity.justification.timing}
PREUVE MARCHÉ : ${opportunity.justification.market_proof}`,
      },
    ],
  });

  let textContent = '';
  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text;
    }
  }

  return textContent;
}
