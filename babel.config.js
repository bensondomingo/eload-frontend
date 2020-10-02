const removeConsolePlugin = [];
if (process.env.VUE_APP_DISABLE_CONSOLE_LOG === 'YES') {
  removeConsolePlugin.push('transform-remove-console');
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: removeConsolePlugin
};
