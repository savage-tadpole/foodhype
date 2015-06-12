(defproject cljs-example "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-3196"]]

  :node-dependencies [[source-map-support "0.2.8"]]

  :plugins [[lein-cljsbuild "1.0.4"]
            [lein-npm "0.4.0"]]

  :source-paths ["cljs"]

  :clean-targets ["cljs-js/server"]

  :cljsbuild {
    :builds [{:id "server"
              :source-paths ["cljs/server"]
              :compiler {
                :main server.core
                :output-to "cljs-js/server.js"
                :output-dir "cljs-js/server"
                :optimizations :none
                :target :nodejs
                :cache-analysis true
                :source-map true}}
             ]})
