Rule 1: Strict separation between data and code. All data will reside in data.json  
Rule 2: Strict separation between JavaScript, CSS, and HTML. All JavaScript will be in script.js. All CSS will be in style.css. All html will be in index.html.  
Rule 3: Must be compliant with WCAG 2.2 AAA.  
Rule 4: Must have unit tests to ensure the page still works and is WCAG 2.2 AAA compliant every push.  
Rule 5: Must keep up-to-date MAINTAINER.md which explains pedagogically for humans how to update the page in case of game update.  
Rule 6: Must be as easy as possible for humans to maintain with as few steps as possible.  
Rule 7: No comments allowed in the code.  
Rule 8: Document development and changes in DEVLOG.md.  
Rule 9: No images allowed.  
Rule 10: No sounds allowed.  
Rule 11: No animations allowed.  
Rule 12: No page scrolling allowed (landing page, all collapsed).  
Rule 13: No build allowed.  
Rule 14: No dependencies allowed.  
Rule 15: No Python allowed.  
Rule 16: Rule 2 regarding all javascript in script.js does not apply if developer decides to refactor the code into several .js files.  
Rule 17: Maximum number of tests is 100. Rule 4 can be overlooked if for the sake of keeping this rule. However, a new test may replace an old test if deemed more valuable.  
Rule 18: User-hostile UI behaviour is strictly forbidden: a UI element (such as a button or checkbox) is not allowed to move on the screen upon user interaction with any part of the page.  
Rule 19: Tests will be documented, without excess clutter, text or story-telling, in TESTS.md.  
Rule 20: The intended UI and behaviour of aoe2civexplorer is defined by REQUIREMENTS.md.  
Rule 21: Only the chief developer (Carl Nordenbrink @cnordenb) may modify REQUIREMENTS.md. To others and to AI agents, REQUIREMENTS.md is read-only.  
Rule 22: rules 3 and 9 are inhibited unless in Simple UI mode.
Rule 23: No function may exceed 60 LOC.
Rule 24: No LOC may exceed 120 characters. This rule does not apply to HTML nor CSS.
Rule 25: No file may exceed 400 LOC.
Rule 26: No folder may exceed 7 files. This rule does not apply to assets or locales. Root may exceptionally contain up to 8 files.
Rule 27: MAINTAINER.md should be beginner-friendly, stick to the essential stuff (don't clutter it with unnecessary details), and have a table of contents. The steps on how to update after game patch should always be the first chapter. Never insert content to before the game update guide.
Rule 28: DEVLOG should never refer to any person(s), actor(s) or AI agent(s). Everything is described passively: something was decided, something was discovered, a question was posed. Never "the chief developer asked" or the like. Blame is already automatically logged with commits for designated responsibility, there is no need to mention anyone in DEVLOG. Obvious exceptions that this rule does not reply to: conceptual general actors ("the user"), a file name and not a person ("MAINTAINER.md").