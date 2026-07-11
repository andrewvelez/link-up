# Discussion: AngelScript, Embedded Systems, and Reusing Small-Device Libraries

## User

Today I'm confounded by seeing online what looks to be situations of different groups of people repeating the same things over and over, re-inventing the wheel. Or at least it appears that way and I may have you help me sort out some mysteries here.

In the embedded device and small board (whatever you call Raspberry Pi) space, there's a need for libraries and software that is closer to hardware or at least unencumbered by the history of desktop development. Some of which I don't know is just re-inventing the wheel or maybe they just don't know they can do something else.

Upon reading one developer's networking woes, he goes on to explain his open source project and it is networking software for Raspberry Pi-like boards and attached audio/video hardware. I link over to something called AngelScript: <https://www.angelcode.com/angelscript/>.

Alas, I'm now reading about something I've never heard of before, wondering all kinds of questions.

1. Why not use an already established scripting language, or do I just throw that up to developer egotism?
2. The scripting language itself seems very advanced, especially seeing how it's statically typed and uses pointer handlers. Why is this needed for small board devices? What benefits does it have?
3. This is the motherlode of questions. Tangential to me reading about this specific topic, I can't help but wonder: if small board software is constrained and we know constraining a project's parameters can improve efficiency, couldn't any project, like mine, choose to use libraries developed for smaller devices? Surely, that would help on mobile devices.

## Assistant

The central confusion is that two different meanings of **embedded** are colliding:

1. **Embedded device software** runs on dedicated or constrained hardware.
2. An **embedded scripting language** is placed inside another application.

AngelScript is primarily the second kind. Its existence is not specifically explained by Raspberry Pi or small-board computing.

### 1. Why create AngelScript instead of using an established language?

AngelScript began in 2003 as a scripting engine designed to be incorporated into C++ applications. Its principal design goal is an unusually direct correspondence between the host application's C++ types and the types visible to scripts. Native C/C++ functions, objects, and methods can often be exposed without writing a translation layer around each one.

That gives it a different niche from languages such as Python, JavaScript, or Lua:

- Python and JavaScript bring fairly substantial language runtimes and their own object models.
- Lua is genuinely small and embeddable, but it is dynamically typed and its language model differs substantially from C++.
- AngelScript deliberately resembles a safer, simplified C++, so a C++ application can expose concepts such as overloads, interfaces, value types, reference types, and operators relatively naturally.

There may have been some developer vanity involved—language creation naturally attracts that—but AngelScript is not merely a recent project-specific reinvention. It has existed for more than twenty years and has been used in substantial games and engines. Modern users include Hazelight's Unreal integration, where most gameplay in titles such as *It Takes Two* and *Split Fiction* was written using it.

Still, your instinct is valid: **creating or adopting an obscure language has a major ecosystem cost**. You lose developers, libraries, editor support, documentation, accumulated debugging knowledge, and long-term certainty. A project should ordinarily choose Lua, JavaScript, Python, or another established option unless it has requirements that those languages satisfy poorly.

AngelScript has a credible answer to “why not Lua?” It is not automatically the better answer.

### 2. Why static typing and object handles? Are they necessary on small devices?

They are not there principally because of small devices.

Static typing benefits the **boundary between the script and its C++ host**. If the application exposes a function taking a particular C++ object, integer type, interface, or value type, the script compiler can verify those uses before execution. This reduces runtime type checks, conversions, wrapper objects, and ambiguous failures.

AngelScript's “object handles” are also not raw pointers. They are managed references resembling smart pointers. Objects are reference-counted, with a garbage collector available for circular references. The application can additionally control the engine's memory allocation.

Those choices provide:

- safer references than C++ pointers;
- predictable interfaces between native code and scripts;
- compilation to portable bytecode;
- sandboxing, because scripts can access only what the host explicitly exposes;
- deterministic execution characteristics;
- suspendable execution, debugging hooks, and controlled memory use.

That combination is useful in a game engine, device controller, media system, or application that needs replaceable behavior without rebuilding the native executable.

A more accurate interpretation is therefore:

> AngelScript is advanced because it is trying to make scripting fit tightly and safely inside a sophisticated native application—not because a Raspberry Pi requires an unusually advanced language.

Also, a Raspberry Pi is normally called a **single-board computer**, or SBC. A modern Pi running Linux is much closer architecturally to a modest desktop/server than to a tiny microcontroller. It can generally run Python, JavaScript, JVM software, containers, databases, and ordinary Linux libraries. “Runs on a Pi” does not necessarily imply genuinely constrained embedded development.

### 3. Could ordinary projects use embedded libraries and become more efficient?

Yes—but not automatically.

A library designed for a constrained device may be smaller because it deliberately omits things:

- Unicode or internationalization;
- threads;
- dynamic allocation;
- filesystem support;
- comprehensive protocol handling;
- large input support;
- extensive error reporting;
- hardware acceleration;
- security hardening;
- convenient abstractions.

It may also assume fixed-size buffers, global state, a single event loop, no operating system, a particular CPU, or direct access to hardware. Those decisions can make it excellent on a microcontroller and awkward or actively inferior in a mobile or desktop application.

Efficiency also has several independent dimensions:

- executable size;
- resident memory;
- CPU time;
- latency;
- battery use;
- network traffic;
- allocation frequency;
- developer time;
- correctness and security.

A tiny embedded implementation can save 200 KB of memory while consuming more CPU because it lacks SIMD, multithreading, kernel integration, or a platform-optimized codec. On a phone, that could mean **worse battery efficiency despite a smaller library**.

So the transferable lesson is not:

> Use libraries written for embedded systems.

It is:

> Impose explicit resource budgets and choose implementations that meet those particular budgets.

For your project, you could absolutely adopt embedded-style disciplines:

- bounded caches rather than unlimited caches;
- streaming instead of loading entire objects into memory;
- explicit ownership and lifecycle rules;
- small dependency surfaces;
- lazy initialization;
- compact wire formats;
- controlled concurrency;
- measurable limits on storage, memory, and background activity.

Those architectural choices will matter much more than whether an individual utility library originated in embedded development.

In your current local Bun/WebView direction, for example, the principal footprint will come from the JavaScript runtime, WebView/browser engine, database, networking stack, and media stack. Replacing a few normal-purpose libraries with tiny embedded equivalents would probably make little measurable difference. Avoiding a duplicated browser runtime, limiting background processes, bounding media caches, and reducing unnecessary network activity would matter far more.

For networking, cryptography, audio, video, and peer-to-peer protocols, aggressive reinvention is often particularly dangerous. Mature implementations carry years of interoperability fixes, security review, congestion behavior, malformed-input handling, and hardware acceleration. A smaller implementation is not necessarily simpler in the dimensions that matter.

Your overall observation remains correct, though: the software world repeatedly recreates similar schedulers, protocols, languages, UI systems, package managers, databases, and runtimes. Sometimes that is ignorance or ego. Frequently it is because an existing solution carries assumptions accumulated for a different environment. The difficult part is distinguishing **a genuinely different constraint set** from **a developer preferring to own the entire stack**. AngelScript falls somewhere toward the legitimate-specialization side: it solves a real C++ integration problem, but most applications still do not need it.
