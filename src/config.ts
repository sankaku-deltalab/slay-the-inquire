import * as TOML from "@iarna/toml";

export type ConfigRaw = {
  tooltips: TooltipInfo[];
};

export type TooltipInfo = {
  keyword: string;
  description: string;
};

export type Config = {
  tooltips: Record<string, TooltipInfo>;
};

export namespace Config {
  export function parse(text: string): Config {
    console.error(text);
    const raw = TOML.parse(text) as ConfigRaw; // TODO: validate
    return {
      tooltips: Object.fromEntries(
        raw.tooltips.map((t) => [t.keyword, t] as const)
      ),
    };
  }
  export function listKeywords(config: Config): string[] {
    return Object.keys(config.tooltips);
  }
}
