import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# Database DSN (postgres://user:pass@host:port/db)
POSTGRES_DSN = os.getenv('POSTGRES_DSN') or os.getenv('DATABASE_URL')

# OpenAI / LangChain config
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ICP_RULE_NAME = os.getenv('ICP_RULE_NAME', 'default')
LANGCHAIN_MODEL = os.getenv('LANGCHAIN_MODEL', 'gpt-4o-mini')
TEMPERATURE = float(os.getenv('TEMPERATURE', '0.3'))


# Turn off all LangChain tracing/telemetry
os.environ["LANGCHAIN_TRACING"]   = "false"
os.environ["LANGCHAIN_TRACING_V2"] = "false"
# Remove any Smith API key so no telemetry is sent
os.environ.pop("LANGSMITH_API_KEY", None)

# Tavily API Key
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')
# ZeroBounce API Key
ZEROBOUNCE_API_KEY = os.getenv('ZEROBOUNCE_API_KEY')

# Add new settings below this line if needed
CRAWLER_USER_AGENT = "ICPFinder-Bot/1.0 (+https://nexiuslabs.com)"
CRAWLER_TIMEOUT_S = 12
CRAWLER_MAX_PAGES = 6

# How many on-site pages to crawl after homepage (for Tavily + merged corpus flow)
CRAWL_MAX_PAGES = int(os.getenv("CRAWL_MAX_PAGES", str(CRAWLER_MAX_PAGES)))

# Keywords to pick high-signal pages from the site nav
CRAWL_KEYWORDS = [
    "pricing", "plans", "packages", "services", "solutions", "products",
    "about", "team", "contact", "industries", "sectors",
    "case studies", "success stories", "portfolio",
    "blog", "news", "insights",
    "careers", "jobs", "hiring",
]

# Max combined characters to send to LLM extraction (cost guard)
EXTRACT_CORPUS_CHAR_LIMIT = int(os.getenv("EXTRACT_CORPUS_CHAR_LIMIT", "35000"))
