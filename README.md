# Peg SoliShare
## Idea
In Peg SoliShare, players can play Peg Solitaire puzzles created by other players around the world, or create and share their own puzzles with the world.
## Inspiration
- "Disappearing Act" puzzle series from Professor Layton and Pandora's Box / the Diabolical Box
- Super Mario Maker series
## External Code
### Help and Snippets
- https://stackoverflow.com/questions/36562953/converting-binary-to-hexadecimal
- https://stackoverflow.com/questions/60688935/my-canvas-drawing-app-wont-work-on-mobile
- https://stackoverflow.com/questions/29216551/making-a-gulpfile-getting-an-error-when-call-gulp-parallel
- https://chrispennington.blog/blog/20201219-compile-and-minify-scss-with-gulpjs-in-hugo/
- https://stackoverflow.com/questions/21988909/is-it-possible-to-create-a-fixed-length-array-in-javascript
- https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
- https://www.sitepoint.com/using-regular-expressions-to-check-string-length/
- https://www.webtips.dev/webtips/javascript/javascript-create-regex-from-string-variable
- https://stackoverflow.com/questions/37199019/method-set-prototype-add-called-on-incompatible-receiver-undefined
- https://youtu.be/R4vV4szAoDY
- Bootstrap documentation
### External Components
- Bootstrap
## To-Do
- Server-side functionality of taking a grid code and list of all previous moves, determining if it is solvable (short-circuiting if the base puzzle is not), if so finding a solution and returning probably only the first move of it (in other words a hint); otherwise determining how many undos are required for a solvable grid.
- Canvas-based game UI for gameplay; drag and drop balls, interface with Configuration class (don't have any solving behavior client-side though)
- Puzzle-creation UI similar to above only balls are either placed manually or generated from reverse-moves; after which it can be uploaded (after being verified as solvable of course)
- Leading to endgame: online functionality ("Course World"); create and upload, or browse and play (rating system? keep track of high scores?) 