/** Где кит лежит относительно корня хранилища — нужно скриптам, которые обращаются к dist/ через файловую систему. */
export const KIT_DIR = "_.Settings/obsidian-kit";

/** Уведомление + прерывание макроса: следующие шаги QuickAdd не выполняются. */
export const makeStop =
  (params: QuickAddParams) =>
  (message: string): never => {
    new params.obsidian.Notice(message, 15000);
    return params.abort(message);
  };
