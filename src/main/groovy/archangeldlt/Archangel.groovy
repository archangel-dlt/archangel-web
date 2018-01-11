package archangeldlt

class Archangel {
  static void main(String... args) {
    if (args.length == 1 && args[0] == '--web')
      WebApi.main()
    else
      CmdLine.main(args)
  } // main
} // class Archangel
