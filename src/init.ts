import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  type ThemeParams,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
} from '@tma.js/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode and initialize it.
  setDebug(options.debug);
  initSDK();

  // Add Eruda if needed.
  if (options.eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Telegram for macOS has bugs, so we mock the environment.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === 'web_app_request_theme') {
          let tp: Partial<ThemeParams> = {};

          if (firstThemeSent) {
            tp = themeParams.state() as Partial<ThemeParams>;
          } else {
            firstThemeSent = true;
            tp = retrieveLaunchParams().tgWebAppThemeParams as Partial<ThemeParams>;
          }

          // ✅ SOLUCIÓN CORREGIDA: Conversión segura para cumplir con `${string}` requerido
          const themeParamsPlain: Record<string, `#${string}` | undefined> = {};
          
          Object.entries(tp).forEach(([key, value]) => {
            if (value) {
              // Asegurar que el valor comience con '#' y sea un string válido
              const colorValue = String(value).startsWith('#') 
                ? String(value) as `#${string}`
                : `#${String(value)}` as `#${string}`;
              themeParamsPlain[key] = colorValue;
            }
          });

          // ✅ Usar type assertion para el evento completo
          emitEvent('theme_changed', { 
            theme_params: themeParamsPlain as {
              [key: string]: `#${string}` | undefined;
              accent_text_color?: `#${string}`;
              bottom_bar_bg_color?: `#${string}`;
              bg_color?: `#${string}`;
              button_color?: `#${string}`;
              button_text_color?: `#${string}`;
              destructive_text_color?: `#${string}`;
              header_bg_color?: `#${string}`;
              hint_color?: `#${string}`;
              link_color?: `#${string}`;
              secondary_bg_color?: `#${string}`;
              section_bg_color?: `#${string}`;
              section_header_text_color?: `#${string}`;
              subtitle_text_color?: `#${string}`;
              text_color?: `#${string}`;
            }
          });
          return;
        }

        if (event.name === 'web_app_request_safe_area') {
          emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
          return;
        }

        next();
      },
    });
  }

  // Mount all components used in the project.
  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }
}
