package archangeldlt

class Archangel {
  static void main(String... args) {
    if (args.length == 0)
      WebApi.main()
    else
      CmdLine.main(args)
  } // main
} // class Archangel
