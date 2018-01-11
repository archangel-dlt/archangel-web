# Archangel

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://archangel-dlt.mit-license.org)

A web client interface for the Archangel DLT p-o-c.

There are two parts:
* Simple query and upload single-page webapp.  This is written in JavaScript using React.
* A tiny backend, throwing a minimal web API around the National Archive's
[DROID](http://www.nationalarchives.gov.uk/information-management/manage-information/policy-process/digital-continuity/file-profiling-tool-droid/)
tool.  The front end uploads files to the back, which runs them through DROID and returns the DROID profile as JSON.
The backend is built in Groovy, using Ratpack.

## Contributing

Bug reports and pull requests are welcome on GitHub at
[https://github.com/archangel-dlt/archangel-web](https://github.com/archangel-dlt/archangel-web).

## Code of Conduct

Everyone interacting in the Archangel project’s codebases, issue trackers, chat rooms and mailing lists
is expected to follow the [code of conduct](https://github.com/archangel-dlt/archangel-web/blob/master/CODE_OF_CONDUCT.md).
