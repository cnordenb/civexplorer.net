NB: This is the old main branch and only has simple UI implentation. It is deprecated and no longer being maintained.

[![GitHub last commit](https://img.shields.io/github/last-commit/cnordenb/aoe2civexplorer)](#)
[![language](https://img.shields.io/badge/language-JavaScript-FFFF00)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![accessibility](https://img.shields.io/badge/accessibility-WCAG_2.2_AAA-A5FFCA)](https://www.w3.org/TR/WCAG22/)
[![license](https://img.shields.io/badge/license-MIT-007FFF)](https://github.com/cnordenb/aoe2civexplorer/blob/main/LICENSE)
[![testing](https://img.shields.io/badge/testing-yes-C3FF00)](https://github.com/cnordenb/aoe2civexplorer/blob/main/documentation/TESTS.md)
[![maintainable](https://img.shields.io/badge/maintainable-yes-00FF72)](https://github.com/cnordenb/aoe2civexplorer/blob/main/documentation/MAINTAINER.md)

# aoe2civexplorer
https://frcp.net/civexplorer/
<img width="1527" height="786" alt="image" src="https://github.com/user-attachments/assets/7049a910-f68d-4f81-bbd6-48f89d837c41" />


## Description

Explore Age of Empires II civilisations by technology availability: mark the buildings, units and technologies a
civilisation must have or must lack, and see which civilisations fit. The page is available in the same 17 languages
as [aoe2techtree.net](https://aoe2techtree.net/), where its data comes from.

### But why?

The in-game tech tree and all existing third party tools I know of let you do one or both of two things:  
- browse tech availability by civilisations, one civilisation at a time.  
- browse civ availability by technologies, one technology at a time.  

aoe2civexplorer lets you explore civ availabilty by technologies, with all technologies and all civilisations simulateously. Find out easily which civs have a specific set of available and unavailable technologies, units, and buildings.

## Installation

aoe2civexplorer requires a server to run and cannot run locally from file due to using .json for data.
However, it is runnable offline (English only) with the html file aoe2civexplorer.html available in [releases](https://github.com/cnordenb/aoe2civexplorer/releases).

## Usage

Filter Age of Empires II civilisations by toggling technologies, units, or buildings. Exempli gratia, find out which civilisations have Arbalester with full upgrades, or which civilisations are missing a certain set of units or technologies. You can find units, technologies, and buildings by either searching for them or browsing the checkbox node tree.

## Contributing

Anyone is welcome to open an [issue](https://github.com/cnordenb/aoe2civexplorer/issues) to submit a bug report or suggest a new feature. Alternatively, you may fork or copy the repository and take it in any direction you wish.

## Maintaining

To keep the page up to date after a game patch, see [MAINTAINER.md](documentation/MAINTAINER.md).

## Acknowledgements

Aoe2techtree © HSZemi. aoe2civpicker uses aoe2techtree for localisation and tech tree data, permissible under aoe2techtree's [MIT license](https://github.com/SiegeEngineers/aoe2techtree/blob/master/LICENSE).

Age of Empires II © Microsoft Corporation. aoe2civexplorer was created under Microsoft's "[Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules)" using assets from Age of Empires II: The Age of Kings, Age of Empires II: HD Edition, and Age of Empires II: Definitive Edition, and it is not endorsed by or affiliated with Microsoft.

Development of aoe2civpicker was accelerated with Claude Opus 5.5.
