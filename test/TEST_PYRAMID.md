# Test Pyramid

<br/>

## What It Is <sup>1</sup>

<pre>
More integration  ↑                          ↑  Slower
                  │            /\            │
                  │           /  \           │
                  │          / UI \          │
                  │         /Tests \         │
                  │        /--------\        │
                  │       / Service  \       │
                  │      /   Tests    \      │
                  │     /--------------\     │
                  │    /   Unit Tests   \    │
                  │   /__________________\   │
More isolation    ↓                          ↓  Faster
</pre>

In this project, we map the three layers to Specs, Behaviors, and Units.

<br/>

## Where We Stand

| Test Type | Number of Tests |
| :-------- | :-------------: |
| Spec Tests | 0 |
| Behavior Tests | 7 |
| Unit Tests | 4 |


<br/>
<br/>
<br/>

<pre>[1]: https://martinfowler.com/articles/practical-test-pyramid.html#TheTestPyramid
