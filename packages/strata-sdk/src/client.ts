export interface StrataClientOptions {
  baseUrl: string;
}

export interface HealthResponse {
  status: string;
}

export class StrataClient {
  private baseUrl: string;

  constructor(options: StrataClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
  }

  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }
}
