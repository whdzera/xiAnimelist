# xiAnimeList

### About
- Jekyll 
- Stimulus.js
- Tailwind css
- Vite build tool
- API Jikan.moe

### Prerequisites
- Ruby 3.0^
- Node 2.2^


### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/spellbooks/jekyll-template-starter.git
cd jekyll-template-starter
```

#### 2. Install Dependencies
```bash
bundle install && npm install
```

#### 3. Run the Development Server
```bash
rake dev
```
the command running jekyll, vite and tailwindcss

open `localhost:4000`

#### 4. Run Rspec Testing
```bash
rake test
```

#### 5. Generate Controller Stimulus
`hello is example`
```bash
rake stimulus[hello]
```
make new file 'hello_controller.js in `app/javascript/controllers`

added import and register hello controller in `app/javascript/application.js`

#### 6. Build js using vite
```bash
rake build
```
file build in `app/build/application.js` 

#### 7. Run Jekyll Sever Production
```bash
rake p
```


### License

MIT License

### Credits

Created by `whdzera`