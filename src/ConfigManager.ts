import defaultsDeep from 'lodash.defaultsdeep';
import get from 'lodash.get';
import os from 'os';

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface ConfigManagerOptions<TConfig> {
  configurations: {
    default: TConfig;
    [env: string]: RecursivePartial<TConfig>;
  };
}

export interface ConfigurationManager<TConfig> {
  get: (key: keyof TConfig, env?: string) => any;
  getConfig: (env?: string) => Readonly<TConfig>;
}

export const createConfigManager = <TConfig>(
  options: ConfigManagerOptions<TConfig>
): ConfigurationManager<TConfig> => {
  const environment = {
    name:
      process.env.NODE_ENV === 'development'
        ? 'default'
        : process.env.NODE_ENV || 'default',
    hostname: os.hostname(),
  };

  const { configurations } = options;
  const configSet = new Map<string, TConfig>();

  configSet.set('default', configurations.default);

  Object.entries(configurations)
    .filter(([env]) => env !== 'default')
    .forEach(([env, config]) => {
      configSet.set(env, defaultsDeep(config, configurations.default));
    });

  const getFitEnvironmentConfig = (env?: string) => {
    if (env) {
      return configSet.get(env);
    }
    if (configSet.has(`local-${environment.name}`)) {
      return configSet.get(`local-${environment.name}`);
    }
    if (configSet.has(`local`)) {
      return configSet.get(`local`);
    }
    if (configSet.has(`${environment.hostname}-${environment.name}`)) {
      return configSet.get(`${environment.hostname}-${environment.name}`);
    }
    if (configSet.has(`${environment.name}`)) {
      return configSet.get(`${environment.name}`);
    }
    return configSet.get('default');
  };

  const configurationManager: ConfigurationManager<TConfig> = {
    get: (key, env) => {
      const config = configurationManager.getConfig(env);
      return get(config, key);
    },

    getConfig: (env) => {
      const config = getFitEnvironmentConfig(env);
      if (!config) {
        throw new Error(
          `No configuration for environment "${env || 'default'}"`
        );
      }
      return config;
    },
  };

  return configurationManager;
};

export default createConfigManager;
