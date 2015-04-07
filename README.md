<<<<<<< HEAD
# textParser

Henry (Fangyi) Li


Acorn vs Esprima?:

In terms of performance, Esprima and Acorn compete head-to-head, and are much closer to each other than they are to other ECMA parsers, such as UglifyJS2 or Traceur (as can be seen on Esprima’s comparison table: http://esprima.org/test/compare.html). The difference in the benchmark was quite negligible when I ran it in my Safari browser, however, so there was no apparent choice. But after some background research, I realized that Acorn had been, in fact, designed solely to build on and surpass Esprima; it was, if you will, another programmer’s algorithmic one-up of the Esprima text parser.

The programmer is Marijn, who states on his blog (http://marijnhaverbeke.nl/blog/acorn.html) that he was actually incidentally involved in the original UglifyJS project, and Acorn was his direct response when he learned that Esprima had outperformed his algorithm in UglifyJS. Acorn turned out to be a significantly faster algorithm than Esprima (not by any factor appreciable by Big O notation, but still five-, six-fold, so appreciable nonetheless), and had a smaller file size to boot. So I decided to run with Acorn.

At the same time, however, I was looking through the documentation for both APIs, and realized that Acorn’s documentation, while being concise, provided no examples to work from, and was very difficult to implement (for me, at my current level of expertise). I decided, thus, to start with Esprima, which had included several example implementations in its github repository. After implementing the code feedback API with Esprima, I then turned back to Acorn, and simply replaced the Esprima-generated AST with Acorn’s variant (which is largely the same). Having implemented both APIs, I had the excellent convenience of being able to benchmark the performance of both, whereupon I found, conclusively, that Acorn ran on average several (~6) times faster than Esprima.

Finally, Acorn claims to run on any JS-enabled browser more recent than IE5, whereas Esprima promises only those more recent than IE8, so Acorn definitely seems like the superior choice in that regard as well.

Implementation:

The API is largely contained in two (mostly identical) files: parseTextAcorn.js and parseTextEsprima.js found in the root/js folder. The function takes user inputted code (taken as a string), and an object, parameters, containing the whitelist, blacklist, and general structure of the desired code (the format of which is shown in my implementation), and returns a string (with some HTML tags for line breaks) that can be inserted into the page. The feedback from the whitelist is simple (either that the code is sound, or missing one (or a few) features). As for the blacklist, the feedback includes the line number and the type of transgression. Finally, the structure feedback, if the user has not provided the right code, reminds them of the desired code structure. This was most the difficult to format, as I haven’t really thought up of an elegant way to convey complicated programming structures, so the information is still communicated quite awkwardly. For example, the provided parameter in the implementation returns:

‘You are missing a ForStatement enclosing a ForStatement enclosing a IfStatement enclosing a ForStatement enclosing a ForStatement enclosing a IfStatement, followed by a IfStatement.’ 

if the structure is not found in the code. But then again, perhaps any code containing as arcane a nested for loop is simply intrinsically awkward.
=======
# textParser
>>>>>>> 386ea0508a453caa56cc81e959ab69319f69b82e
