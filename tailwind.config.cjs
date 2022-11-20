/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        "green": "#1db954",
        "black-base":"#121212",
        "black-primary": "#191414",
        "black-secondary": "#171818",
        "light-black":"#282828",
        "primary": "#FFFFFF",
        "secondary" : "#b3b3b3",
        "gray" : "#535353"
      },
      gridTemplateColumns: {
        'auto-fill-cards':'repeat(auto-fill, minmax(200px, 1fr))'
      },
    },
  },
  plugins: [
    // This plugin is used to sort up the description of pertuicular playlist we can use directly use line-clamp-2 to avoid much description (restricted to 2)
    require('@tailwindcss/line-clamp'),
  ],
}
