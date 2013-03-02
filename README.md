EstimationGame
==============

The estimation game is the cure for your roadmap estimation woes. It is based on similar principles to the already tried and tested planning poker. The idea is not to perform detailed estimates that are difficult to maintain and often hugely innaccurate and consequently misleading. It is assumed that as time goes by new information becomes available and that estimates should be constantly revised. This constant revision requires that the solution be cheap in the valued time of contributors.

The hypothesis is that if people make quick judgement calls as to the relative sizes of future and past roadmap items, their actual sizes can be algorithmically inferred. To achieve this the simplest questions should be asked to minimize the thought overhead in making comparisons.

To a contributor the simplest question is, given 2 roadmap items, which is bigger? A slightly more complicated follow up question could be, is the bigger an order of magnitude bigger than the other? We might suggest that the possible orders of magnitude would be based on the Fibonacci sequence. Contributors should regularly spend a sensible amount of time playing the estimation game. Contributors to the estimation game should be those people likely to be responsible for implementing the roadmap items.

## Backlog

* To set up the estimation game first add past, present and future road map items including known details.
	* allow new items to be added
	- allow editing of existing items
	- if no items then display message saying there are no items
- Next add the actual effort expended on past roadmap items in the desired output units.
- The estimation game will collect new estimation data by presenting random or algorithmically selected comparisons of roadmap items to the contributors.
- The estimation game will calculate expected effort estimates based on the simple data collected and previous actual effort submissions.
- The estimation game will present estimates with confidence levels based on variance and possible inconsistencies/conflicts in comparisons.
- The estimation game may adjust its comparison selection algorithm in order to resolve potentially conflicting or outlying estimate data.
- The estimation game may collect and present comments from contributors when resolving potentially conflicting or outlying data.
- As roadmap items are completed the actual expended effort will be added to improve future estimates.
- The estimation game may group contributors and road map items to ensure that the contributors are actually implementers.

## Contributing

### Dependencies

- [Meteor](http://meteor.com/main)

### Notes

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

## License

Copyright (c) 2012 Peter Halliday  
Licensed under the MIT license.